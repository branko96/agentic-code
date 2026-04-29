export type Messages = {
  metadata: {
    title: string;
    description: string;
  };
  auth: {
    checkingSession: string;
    loggedInTitle: string;
    loggedInAs: string;
    logout: string;
    loginTitle: string;
    loginDescription: string;
    email: string;
    password: string;
    login: string;
    loggingIn: string;
    loginError: string;
  };
  errors: {
    notFound: string;
  };
};
