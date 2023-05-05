import { Request, Response, NextFunction } from 'express';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { CompatibilityDataModel } from '../models/compability-model';

export interface LanguageStats {
  [key: string]: number;
}

export interface RepoData {
  language: string | null;
  size: number;
}

export interface CompatibilityData {
  languages: LanguageStats;
  repoCount: number;
  totalSize: number;
  user: string;
  org: string;
  createdAt?: Date;
}

const PER_PAGE_LIMIT = 50;
const LANGUAGE_LIMIT = 5;

const getLanguageStats = (repos: RepoData[]): LanguageStats => {
  const stats: LanguageStats = {};

  repos.forEach((repo) => {
    if (repo.language) {
      if (stats[repo.language.toLowerCase()]) {
        stats[repo.language.toLowerCase()] += repo.size;
      } else {
        stats[repo.language.toLowerCase()] = repo.size;
      }
    }
  });

  return stats;
};

const calculateCompability = async (
  req: Request,
  res: Response,
  _: NextFunction,
) => {
  const org = req.query.org as string;
  const user = req.query.user as string;
  const token = process.env.ACCESS_TOKEN as string;

  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
  };

  try {
    await axios.get(`https://api.github.com/orgs/${org}`, { headers });
  } catch (error) {
    if (error instanceof AxiosError) {
      return res.status(400).send('Invalid organization');
    }
    return res.status(500).send('Error while calculating the compability');
  }

  try {
    await axios.get(`https://api.github.com/users/${user}`, { headers });
  } catch (error) {
    if (error instanceof AxiosError) {
      return res.status(400).send('Invalid user');
    }
    return res.status(500).send('Error while calculating the compability');
  }

  try {
    const orgPromise = axios.get(
      `https://api.github.com/orgs/${org}/repos?per_page=${PER_PAGE_LIMIT}`,
      { headers },
    );

    const userPromise = axios.get(
      `https://api.github.com/users/${user}/repos?per_page=${PER_PAGE_LIMIT}`,
      { headers },
    );

    const responses: AxiosResponse[] = await Promise.all([
      orgPromise,
      userPromise,
    ]);

    const orgRepos: RepoData[] = responses[0].data;
    const userRepos: RepoData[] = responses[1].data;

    const orgLanguageStats: LanguageStats = getLanguageStats(orgRepos);
    const userLanguageStats: LanguageStats = getLanguageStats(userRepos);

    const compatibilityData: CompatibilityData = {
      languages: {},
      repoCount: orgRepos.length + userRepos.length,
      totalSize: 0,
      user,
      org,
    };

    let languageCount = 0;

    for (const language of Object.keys(userLanguageStats)) {
      const lowerCaseLang = language.toLowerCase();
      const orgSize = orgLanguageStats[lowerCaseLang];
      const userSize = userLanguageStats[lowerCaseLang];

      const totalSize = (orgSize || 0) + (userSize || 0);

      const compability =
        !userSize || !orgSize ? 0 : (userSize / totalSize) * 100;

      compatibilityData.languages[lowerCaseLang] = compability;
      compatibilityData.totalSize += totalSize;

      languageCount++;

      if (languageCount === LANGUAGE_LIMIT) {
        break;
      }
    }

    const compatibilityDataDB = new CompatibilityDataModel(compatibilityData);
    await compatibilityDataDB.save();

    return res.status(200).send('Compability data calculated succesfully');
  } catch (err) {
    console.log(`Error::${err}`);
    return res.status(500).send('Error while calculating the compability');
  }
};

export default {
  calculateCompability,
};
