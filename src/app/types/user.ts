export interface User {
  id: string;
  username: string;
  email: string;
  // Add any other user properties you need
}

export interface LoginCredentials {
  username: string;
  password: string;
}
