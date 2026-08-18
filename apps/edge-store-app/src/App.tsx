import { ThemeProvider } from "./theme/ThemeProvider";
import { ToastProvider } from "./components/ui/ToastProvider";
import { SetupWizard } from "./setup/SetupWizard";
import "./main.css";

const App = () => {
  return(
    <ThemeProvider>
      <ToastProvider>
        <SetupWizard />
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;