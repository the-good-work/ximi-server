export type StatusCode = 200 | 422 | 404 | 500 | 401 | 403;
export type ErrorTypeResponse = "ROOM_MAX" | "ROOM_EXIST" | "NICKNAME_EXIST";
export type GenericResponse = {
  success: true | false;
  code: StatusCode;
  message: string;
  data?: any;
};
