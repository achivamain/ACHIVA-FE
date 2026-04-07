export type Organization = {
  id: number;
  name: string;
  description: string;
  requiresPassword: boolean;
};

export type OrganizationListResponse = {
  status: string;
  code: number;
  message: string;
  data: Organization[];
};
