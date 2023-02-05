type ErrorFieldType = {
    field: string,
    message: string,
};

export const isPayloadValid = (payload: Object, schema: Object) => {
    const errors: Array<ErrorFieldType> = [];
    const addError = (field: string, message: string) => errors.push({ field, message });
    const checkRequired = (payload: Object) => {
        Object.entries(schema).forEach(([key, value]) => {
            const { required } = value;
            // @ts-ignore
            required && !payload.hasOwnProperty(key) ? addError(key, `The ${key} field is required`) : null;
        });
    }
    const checkSimpleType = (key: string, value: any) => {
        // @ts-ignore
        const { type } = schema[key];
        const isHardType = ['date'].includes(type);
        if (isHardType) return;
        // @ts-ignore
        if (schema[key].hasOwnProperty('default') && value === schema[key].default) return;
        if (type === 'enum' && !Array.isArray(value)) {
            addError(key, `The ${key} field type should be a ${type}`);
        } else if (type !== 'enum' && type !== typeof value) {
            addError(key, `The ${key} field type should be a ${type}`);
        }
    }
    const checkHardType = (key: string, value: any) => {
        // @ts-ignore
        const { type } = schema[key];
        if (type !== 'date') return;
        // @ts-ignore
        const isPatternValid = schema[key].pattern 
            // @ts-ignore
            ? schema[key].pattern.match(/(-?\d+|_):(-?\d+|_):(-?\d+|_)T(-?\d+|_):(-?\d+|_):(-?\d+|_)/gm)
            : false;
        if (isPatternValid) return;
        
        typeof value !== 'string' || isNaN(Date.parse(value)) 
            ? addError(key, `The ${key} field type should be a date`)
            : null;
    };
    const checkConditions = (key: string, value: any) => {
        // @ts-ignore
        const { type, condition, maxLength } = schema[key];
        const valueField = value;
        if (maxLength && typeof value === 'string') {
            value.length > maxLength
                ? addError(key, `The ${key} field length must be ${maxLength}`)
                : null;
        }
        if (!condition) return;
        // @ts-ignore
        if (schema[key].hasOwnProperty('default') && value === schema[key].default) return;
        if (type === 'number') {
            const [from, to] = condition;
            const notInRange = !(valueField >= from && valueField <= to);
            notInRange 
                ? addError(key, `The ${key} field is out of range ${from}-${to}, now ${valueField}`)
                : null;
        } else if (type === 'enum') {
            for (let i = 0; i < valueField.length; i++) {
                const v = valueField[i];
                if (!condition.includes(v)) {
                    addError(key, `The ${key} field is out of range enum`);
                    break;
                }
            }
        }
    };

    const collectAndInitDefault = (payload: Object) => { 
        const defaultFields = { ...payload };
        const setDateByPattern = (defaultPattern: string, depField: any = '') => {
            if (defaultPattern === '_:_:_T_:_:_') return new Date().toISOString();

            const depDate = depField ? new Date(depField) : new Date();
            
            const [date, time] = defaultPattern.split('T');
            const [year, month, day] = date.split(':');
            const [hour, min, sec] = time.split(':');

            year !== '_' ? depDate.setFullYear(depDate.getFullYear() + Number(year)) : null;
            month !== '_' ? depDate.setMonth(depDate.getMonth() + Number(month)) : null;
            day !== '_' ? depDate.setDate(depDate.getDate() + Number(day)) : null;
            hour !== '_' ? depDate.setHours(depDate.getHours() + Number(hour)) : null;
            min !== '_' ? depDate.setMinutes(depDate.getMinutes() + Number(min)) : null;
            sec !== '_' ? depDate.setSeconds(depDate.getSeconds() + Number(sec)) : null;

            return depDate.toISOString();
        };

        Object.entries(schema).forEach(([key, value]) => {
            const isDefaultAndNotExistInPayload = value.hasOwnProperty('default') && !payload.hasOwnProperty(key);
            if (!isDefaultAndNotExistInPayload) return;
            value.type === 'date' 
                // @ts-ignore
                ? defaultFields[key] = setDateByPattern(value.default, payload[value.dep]) 
                // @ts-ignore
                : defaultFields[key] = value.default;
        });
        return defaultFields;
    }
    
    checkRequired(payload);
    Object.entries(payload).forEach(([key, value]) => {
        checkSimpleType(key, value);
        checkHardType(key, value);
        checkConditions(key, value);
    });

    return { errors: { errorsMessages: errors }, result: !errors.length ? collectAndInitDefault(payload) : null }
};