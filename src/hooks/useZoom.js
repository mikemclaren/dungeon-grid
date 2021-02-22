import keyboardjs from "keyboardjs";
import { useEffect, useState } from "react";

export const useZoom = () => {
  const [zoom, setZoom] = useState(5);

  useEffect(() => {
    keyboardjs.bind('-', (e) => {
      setZoom((z) => {
        if (z > 0) {
          return z - 1;
        }

        return z;
      });
    });

    keyboardjs.bind('=', (e) => {
      setZoom((z) => {
        if (z < 10) {
          return z + 1;
        }

        return z;
      });
    });

    return () => {
      keyboardjs.unbind('-');
      keyboardjs.unbind('=');
    };
  }, []);  

  return [zoom, setZoom];
};

export default useZoom;