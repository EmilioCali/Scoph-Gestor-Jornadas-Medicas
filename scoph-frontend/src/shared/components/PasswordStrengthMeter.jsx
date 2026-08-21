import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { getPasswordStrength } from "../utils/passwordStrength.js";

const LEVEL_STYLES = {
  weak: { bar: "bg-red-500", width: "w-1/3", text: "text-red-600" },
  medium: { bar: "bg-yellow-500", width: "w-2/3", text: "text-yellow-700" },
  secure: { bar: "bg-green-500", width: "w-full", text: "text-green-600" },
};

export default function PasswordStrengthMeter({ password }) {
  const strength = getPasswordStrength(password);
  const style = LEVEL_STYLES[strength.level];

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-500">Fortaleza de contraseña</span>
        <span className={`text-xs font-semibold ${style.text}`}>{strength.label}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${style.bar} ${style.width}`} />
      </div>
      <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
        {strength.checks.map((check) => (
          <li key={check.key} className="flex items-center gap-1.5 text-xs text-gray-500">
            {check.passed ? (
              <CheckCircleIcon className="h-4 w-4 shrink-0 text-green-500" />
            ) : (
              <XCircleIcon className="h-4 w-4 shrink-0 text-gray-300" />
            )}
            <span>{check.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
