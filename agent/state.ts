
export interface EditSuggestion {
  id:number,
  path:string,
  original:any,
  updated:any,
  diff:string,
  preview:boolean
}


export const agentState = {
  project: {
    suggestions: [] as EditSuggestion[]
  },
  debug: {
    lastCommand:'',
    lastError:'',
    attempts:0,
  },
  edits: {
    pending:[],
    preview:[],
  }
}
export const stateAgent = {
  maxIterations:10,
}
