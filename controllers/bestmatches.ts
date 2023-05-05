import { Request, Response, NextFunction } from 'express';
import { CompatibilityDataModel } from '../models/compability-model';

const getBestMatches = async (req: Request, res: Response, _: NextFunction) => {
  const lang = req.query.lang as string;
  try {
    const results = await CompatibilityDataModel.find({
      [`languages.${lang.toLowerCase()}`]: { $exists: true },
    })
      .sort({ [`languages.${lang.toLowerCase()}`]: -1 })
      .exec();

    return res.status(200).json(
      results.map((result) => {
        return {
          user: result.user,
          org: result.org,
          language: { [lang]: result.languages[lang] },
        };
      }),
    );
  } catch (err) {
    console.log(`Error::${err}`);
    return res.status(500).send('Error while getting best matches');
  }
};

export default {
  getBestMatches,
};
