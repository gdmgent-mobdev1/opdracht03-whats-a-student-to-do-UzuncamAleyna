const root = document.getElementById('app') as HTMLElement;
interface State {
  id: string,
  title: string
  description: string
  comments: string[],
  deadline: string,
}

type Property = keyof State;

export { root };
export type { State, Property };
