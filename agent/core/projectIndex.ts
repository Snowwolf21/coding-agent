export type IndexedFile = {
  path: string;
  content: string;
};

export const projectIndex: {
  files: IndexedFile[];
} = {
  files: [],
};