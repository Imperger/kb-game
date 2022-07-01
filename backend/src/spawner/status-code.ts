export enum SpawnerStatusCode {
  Ok = 0,
  UnknownError = 100,
  SpawnerAlreadyAdded,
  HostNotResponse,
  HostNotFound,
  WrongSecret,
  RequestInstanceFailed,
  ListGameFailed,
};
