## Input validation

Validation occur in `src/common/pipes/dto-validation.pipe.ts`. 
Input validator tests only types ends with `Dto`. E.g. `CreateUserDto`, `LoginInfo_Dto`, `AAAADto`

## Status codes distribution

common - 1 - 100
spawner - 100-200
game - 200-300
auth - 300-400
scenario - 400-500
