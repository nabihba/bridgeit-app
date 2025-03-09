import { Client, Account, Databases } from 'appwrite';

const client = new Client()
.setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('67bc33460027a4b1ecac');

export const account = new Account(client);
export const database = new Databases(client);
