export interface Command {
  type: string;
  execute: () => void;
  undo: () => void;
  /** Commands with the same coalesceKey within 300ms are merged */
  coalesceKey?: string;
}

export class UndoStack {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private lastCommandTime = 0;
  private readonly coalesceWindow = 300; // ms

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  push(command: Command): void {
    const now = Date.now();
    const lastCommand = this.undoStack[this.undoStack.length - 1];

    // Coalesce if same key within window
    if (
      command.coalesceKey &&
      lastCommand?.coalesceKey === command.coalesceKey &&
      now - this.lastCommandTime < this.coalesceWindow
    ) {
      // Replace the last command but keep its undo
      this.undoStack[this.undoStack.length - 1] = {
        ...command,
        undo: lastCommand.undo,
      };
    } else {
      this.undoStack.push(command);
    }

    this.redoStack = [];
    this.lastCommandTime = now;
  }

  undo(): void {
    const command = this.undoStack.pop();
    if (!command) return;
    command.undo();
    this.redoStack.push(command);
  }

  redo(): void {
    const command = this.redoStack.pop();
    if (!command) return;
    command.execute();
    this.undoStack.push(command);
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
