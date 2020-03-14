import * as admin from 'firebase-admin';


export const initialGameState = (id: string, created: admin.firestore.FieldValue) => ({
  id,
  created,
  counter: 0,
  status: 'waiting'
});
