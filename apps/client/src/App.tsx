import React from "react";
import "./App.css";
import { HpProvider } from "./features/hp";

function App() {
  const $isInitialized = React.useRef(false);

  React.useEffect(() => {
    if ($isInitialized.current) {
      return;
    }

    new HpProvider({
      url: "ws://localhost:4000",
    });
    $isInitialized.current = true;
  }, []);

  return <div className="App"></div>;
}

export default App;
