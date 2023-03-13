import React from "react";
import * as Y from "yjs";
import { nanoid } from "nanoid";

interface ITodo {
  id: string;
  title: string;
}

const initObject = {
  todos: {} as ITodo,
};

type Store<Init extends Record<string, any>> = {
  [K in keyof Init]: Y.Map<Init[K]>;
};

function initStore(yDoc: Y.Doc): Store<typeof initObject> {
  const store: any = {};
  for (const key of Object.keys(initObject)) {
    store[key] = yDoc.getMap(key);
  }
  return store as Store<typeof initObject>;
}

function useStore() {
  const [yDoc] = React.useState(() => new Y.Doc());
  const [store, setStore] = React.useState(() => initStore(yDoc));

  React.useEffect(() => {
    yDoc.on("update", () => {
      setStore(initStore(yDoc));
    });
  }, []);

  function _todos() {
    return yDoc.getMap<ITodo>("todos");
  }

  return {
    yDoc,
    todos: {
      getAll() {
        return Array.from(_todos().values()) as ITodo[];
      },
      create({ title }: Pick<ITodo, "title">) {
        const id = nanoid();
        _todos().set(id, { id, title });
      },
      update(id: string, fn: (old: ITodo) => ITodo) {
        const old = _todos().get(id);
        if (old) {
          const updated = fn(old);
          _todos().set(id, updated);
        }
      },
    },
  };
}

export { useStore };
