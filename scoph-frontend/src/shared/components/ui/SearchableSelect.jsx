import { useEffect, useMemo, useRef, useState } from "react";

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function SearchableSelect({
  name,
  value = "",
  options = [],
  onChange,
  placeholder = "Seleccionar",
  className = "",
  disabled = false,
  required = false,
}) {
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedOption = options.find((option) => String(option.value) === String(value));
  const selectedLabel = selectedOption?.label ?? "";
  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return options;
    return options.filter((option) => normalize(option.label).includes(normalizedQuery));
  }, [options, query]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectOption = (option) => {
    onChange({ target: { name, value: option.value } });
    setQuery("");
    setIsOpen(false);
  };

  const handleInputChange = (event) => {
    setQuery(event.target.value);
    setIsOpen(true);
    if (!event.target.value) onChange({ target: { name, value: "" } });
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      setQuery("");
    }
    if (event.key === "Enter" && isOpen && filteredOptions[0]) {
      event.preventDefault();
      selectOption(filteredOptions[0]);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        name={name}
        value={isOpen ? query : selectedLabel}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        className={`w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 placeholder-gray-400 transition ${className}`}
      />
      {isOpen && !disabled && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
        >
          {filteredOptions.length ? (
            filteredOptions.map((option) => (
              <li key={String(option.value)} role="option" aria-selected={String(option.value) === String(value)}>
                <button
                  type="button"
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-orange-50 focus:bg-orange-50 focus:outline-none"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectOption(option)}
                >
                  {option.label}
                </button>
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-sm text-gray-400">Sin coincidencias</li>
          )}
        </ul>
      )}
    </div>
  );
}
