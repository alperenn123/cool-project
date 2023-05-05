import { Request, Response, NextFunction } from 'express';
import axios, { AxiosResponse } from 'axios';
import { CompatibilityDataModel } from '../models/compability-model';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import controller, {
  CompatibilityData,
  RepoData,
} from '../controllers/compability';

jest.mock('axios');
let mongoServer: MongoMemoryServer;

describe('compability-controller', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoURI = mongoServer.getUri();
    await mongoose.connect(mongoURI);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('calculateCompability', () => {
    let next: NextFunction;
    let accessToken: string;

    beforeEach(() => {
      next = jest.fn() as NextFunction;
      jest.resetAllMocks();
      accessToken = 'test-token';
      process.env.ACCESS_TOKEN = accessToken;
    });

    it('should return a success message and save compatibility data to the database', async () => {
      const mockAxiosGet = jest.mocked(axios.get);
      const mockSave = jest.spyOn(CompatibilityDataModel.prototype, 'save');
      const user = 'test-user';
      const org = 'test-org';

      const headers = {
        Authorization: `token ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      };

      const req = {
        query: {
          org,
          user,
        },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      const orgRepos: RepoData[] = [
        { language: 'JavaScript', size: 1000 },
        { language: 'Python', size: 500 },
        { language: null, size: 200 },
        { language: 'JavaScript', size: 300 },
        { language: 'TypeScript', size: 400 },
      ];

      const userRepos: RepoData[] = [
        { language: 'JavaScript', size: 800 },
        { language: 'TypeScript', size: 1000 },
        { language: 'JavaScript', size: 200 },
      ];

      mockAxiosGet.mockImplementation((url: string): Promise<AxiosResponse> => {
        if (url.includes('orgs')) {
          return Promise.resolve({
            data: orgRepos,
          } as AxiosResponse);
        } else if (url.includes('users')) {
          return Promise.resolve({
            data: userRepos,
          } as AxiosResponse);
        }

        throw new Error(`Unexpected URL: ${url}`);
      });

      await controller.calculateCompability(req, res, next);

      expect(mockAxiosGet).toHaveBeenCalledTimes(4);
      expect(mockAxiosGet).toHaveBeenNthCalledWith(
        1,
        `https://api.github.com/orgs/${org}`,
        {
          headers,
        },
      );
      expect(mockAxiosGet).toHaveBeenNthCalledWith(
        2,
        `https://api.github.com/users/${user}`,
        {
          headers,
        },
      );
      expect(mockAxiosGet).toHaveBeenNthCalledWith(
        3,
        `https://api.github.com/orgs/${org}/repos?per_page=50`,
        {
          headers,
        },
      );
      expect(mockAxiosGet).toHaveBeenNthCalledWith(
        4,
        `https://api.github.com/users/${user}/repos?per_page=50`,
        { headers },
      );

      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledWith(
        'Compability data calculated succesfully',
      );
      const compatibilityData: CompatibilityData | null =
        await CompatibilityDataModel.findOne({
          user,
          org,
        }).lean();

      expect(compatibilityData?.languages).toEqual({
        javascript: expect.any(Number),
        typescript: expect.any(Number),
      });
    });
  });
});
