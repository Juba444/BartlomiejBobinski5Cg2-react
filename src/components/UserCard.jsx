// name age city
// jan kowalski lat:18 miasto:Warszwa

function UserCard({ name, age, city }) {
  return (
    <div>
      <h2>{name}</h2>
      <p>wiek: {age}</p>
      <p>miasto: {city}</p>
    </div>
  );
}

export default UserCard;