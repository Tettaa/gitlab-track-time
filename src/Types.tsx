type UserData = {
    url?: string,
    token?: string;
    userName?: string;
  };


  type IssueData = {
    gitlabId: string,
    title: string,
    projectTitle: string,
    projectWebUrl?: string,
    description?: string,
  };


export type {UserData, IssueData};