import { IUser } from './user.model';

export const sampleWithRequiredData: IUser = {
  id: 24814,
  username: 'nuGud',
};

export const sampleWithPartialData: IUser = {
  id: 966,
  username: 'a',
};

export const sampleWithFullData: IUser = {
  id: 5440,
  username: 'h',
};
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
