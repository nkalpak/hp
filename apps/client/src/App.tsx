import React from "react";
import "./App.css";
import { HpProvider } from "./features/hp";
import { useStore } from "./features/store/store";

function App() {
  const $isInitialized = React.useRef(false);
  const store = useStore();

  React.useEffect(() => {
    if ($isInitialized.current) {
      return;
    }

    new HpProvider({
      url: "ws://localhost:4000",
      document: store.yDoc,
    });

    $isInitialized.current = true;
  }, []);

  return (
    <div className="App">
      {store.todos.getAll().map((todo) => (
        <div>
          <input
            type="text"
            value={todo.title}
            onChange={(event) => {
              store.todos.update(todo.id, (old) => ({
                ...old,
                title: event.target.value,
              }));
            }}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() => {
          store.todos.create({
            title: "Untitled",
          });
        }}
      >
        Create
      </button>
    </div>
  );
}

export default App;
