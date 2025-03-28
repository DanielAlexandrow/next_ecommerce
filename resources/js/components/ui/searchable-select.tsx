import * as React from "react";
import Select from "react-select";
import AsyncSelect from "react-select/async";

interface Option {
    value: number;
    label: string;
}

interface SearchableSelectProps {
    options: Option[];
    loadOptions?: (inputValue: string) => Promise<Option[]>;
    value: number[];
    onChange: (value: Option[] | null) => void;
    placeholder?: string;
    isMulti?: boolean;
    isLoading?: boolean;
    isClearable?: boolean;
    className?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options,
    loadOptions,
    value,
    onChange,
    placeholder = "Select...",
    isMulti = false,
    isLoading = false,
    isClearable = true,
    className = "",
}) => {
    const selectValue = React.useMemo(() => {
        if (!value || !options) return null;
        return options.filter(option => value.includes(option.value));
    }, [value, options]);

    if (loadOptions) {
        return (
            <AsyncSelect
                value={selectValue}
                onChange={onChange}
                loadOptions={loadOptions}
                isMulti={isMulti}
                isClearable={isClearable}
                placeholder={placeholder}
                className={className}
                classNamePrefix="select"
                isLoading={isLoading}
            />
        );
    }

    return (
        <Select
            value={selectValue}
            onChange={onChange}
            options={options}
            isMulti={isMulti}
            isClearable={isClearable}
            placeholder={placeholder}
            className={className}
            classNamePrefix="select"
            isLoading={isLoading}
        />
    );
};

export default SearchableSelect;