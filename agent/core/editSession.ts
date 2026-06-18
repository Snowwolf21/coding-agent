type Edit = {
  path: string;
  diff: string;
};

export class EditSession {
  edits: Edit[] = [];

  add(
    path: string,
    diff: string
  ) {
    this.edits.push({
      path,
      diff,
    });
  }

  getSummary() {
    return this.edits
      .map(
        (e) =>
          `${e.path}\n${e.diff}`
      )
      .join("\n\n");
  }
}