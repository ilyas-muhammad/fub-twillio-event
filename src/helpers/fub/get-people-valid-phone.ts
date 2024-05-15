import { FubPeople } from '../../types';

export const getPeopleValidPhone = (person: FubPeople): string | null => {
    const { phones } = person;
    const validPhone = phones.find(({ status }) => status === 'Valid');
    return validPhone ? validPhone.normalized : null;
};
