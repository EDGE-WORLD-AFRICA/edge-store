import { ThemeProvider } from "./theme/ThemeProvider";
import { SetupWizard } from "./setup/SetupWizard";
import "./main.css";

const App = () => {
  return(
    <ThemeProvider>
      <SetupWizard />
    </ThemeProvider>
  );
};

export default App;