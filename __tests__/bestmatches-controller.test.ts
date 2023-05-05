import { Request, Response, NextFunction } from 'express';
import { CompatibilityDataModel } from '../models/compability-model';
import bestMatchesController from '../controllers/bestmatches';

jest.mock('../models/compability-model');

describe('bestmatches-controller', () => {
  const mockRequest = {} as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  } as unknown as Response;

  const mockNextFunction = jest.fn() as unknown as NextFunction;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBestMatches', () => {
    it('should return the best matches for a given language', async () => {
      const mockResults = [
        {
          user: 'User A',
          org: 'Org A',
          languages: { en: 90, es: 80 },
        },
        {
          user: 'User B',
          org: 'Org B',
          languages: { en: 80, es: 90 },
        },
      ];
      const mockExec = jest.fn().mockResolvedValue(mockResults);
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      const mockFind = jest
        .fn()
        .mockReturnValue({ sort: mockSort, exec: mockExec });

      CompatibilityDataModel.find = mockFind;

      mockRequest.query = { lang: 'en' };

      const jsonSpy = jest.spyOn(mockResponse, 'json');

      await bestMatchesController.getBestMatches(
        mockRequest,
        mockResponse,
        mockNextFunction,
      );

      expect(CompatibilityDataModel.find).toHaveBeenCalledWith({
        'languages.en': { $exists: true },
      });
      expect(mockSort).toHaveBeenCalledWith({ 'languages.en': -1 });
      expect(jsonSpy).toHaveBeenCalledWith([
        {
          user: 'User A',
          org: 'Org A',
          language: { en: 90 },
        },
        {
          user: 'User B',
          org: 'Org B',
          language: { en: 80 },
        },
      ]);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });
});
