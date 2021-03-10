import "./Encyclopedia.css";

const Encyclopedia = ({
  monster = {}
}) => {
  return (
    <div className="Encyclopedia">
      <div className="">
        <h2>{monster.name}</h2>

        <span>{monster.size} {monster.type}</span>
      </div>
    </div>
  );
};

export default Encyclopedia;