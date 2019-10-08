import { gql } from 'apollo-boost';

export default gql`
  query GetConfirmUserUrls {
    mSetting(key: "confirm_user_urls") {
      id
      key
      value
    }
  }
`;

export interface IConfirmUserUrls {
  mSetting: {
    key: string;
    value: any;
  };
}
