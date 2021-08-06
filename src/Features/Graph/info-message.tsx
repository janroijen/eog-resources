import React, { useState, useEffect } from 'react';
import { CSSProperties } from '@material-ui/core/styles/withStyles';

const styleContainer: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
};

const styleMessage: CSSProperties = {
  backgroundColor: '#222222',
  color: '#eeeeee',
  fontWeight: 'bold',
  textAlign: 'center',
  padding: '20px',
  margin: '20px',
};

const secondsUntilHidden = 3;

const InfoMessage = () => {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setTimeout(() => setHidden(true), 1000 * secondsUntilHidden);
  }, []);

  return (
    <div style={styleContainer}>
      <div style={styleMessage} hidden={hidden}>
        <p>Thank you for reviewing this application!</p>
        <p>J.H. Roijen</p>
        <p>j.h.roijen@gmail.com</p>
        <p>346-233-8893</p>
      </div>
    </div>
  );
};

export default InfoMessage;
