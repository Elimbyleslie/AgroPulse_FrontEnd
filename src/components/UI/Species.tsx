import { useState } from "react";
import {useSpecies} from '../../hooks/useSpecies';
import { Species } from "../../models/species";

const  SpeciesSelect =() => {
  const { species, isLoading } = useSpecies();
  const [selected, setSelected] = useState("");

  return (
    <select
      value={selected}
      onChange={(e) => setSelected(e.target.value)}
      disabled={isLoading}
    >
      {species.map((sp:Species) => (
        <option key={sp.id} value={sp.code}>
          {sp.name}
        </option>
      ))}
    </select>
  );
}
export default  SpeciesSelect;