export let app: Firebase;

export const init = () => {
    app = new Firebase();
}

interface Firebase {
  app: any;
}

const createGame = () => ({data:{id:1}})
const getGame = () => ({data:{}})
const createPlayer = (data:any) => data

const mocks: { [char: string]: any } = {
	createGame,
	getGame,
	createPlayer,
}

class Firebase implements Firebase {

  constructor () {
    this.app = {}
  }

  getFirestore = (): any => ({})
  callFn = (id: string, data: any): Promise<any> => Promise.resolve(mocks[id](data))
  getGame = (id: string): any => ({onSnapshot: () => {}})
  getPlayers = (id: string): any => ({get:() => Promise.resolve({docs:[]})})
}

