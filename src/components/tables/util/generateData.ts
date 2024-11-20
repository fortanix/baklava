
import { seed, randFirstName, randLastName, randEmail, randCompanyName, randBetweenDate } from '@ngneat/falso';

export const generateData = ({ numItems = 10 } = {}) => {
  seed('some-constant-seed'); // Use a fixed seed for consistent results
  
  const data = [];
  
  for (let i = 0; i < numItems; i += 1) {
    const firstName = randFirstName();
    const lastName = randLastName();
    data.push({
      id: i,
      name: `${firstName} ${lastName}`,
      email: randEmail({ firstName, lastName }),
      company: randCompanyName(),
      joinDate: randBetweenDate({ from: new Date('01/01/2020'), to: new Date() }),
    });
  }
  
  return data;
};
