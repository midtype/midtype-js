import React, { useState, useCallback } from 'react';

export interface IMidtypeContext {
  actions: IActions;
  user: IUser;
  update: () => void;
}

export const MidtypeContext = React.createContext<IMidtypeContext | null>(null);

const getCurrentContext = () => {
  const { mt } = window as any;
  console.log(mt);
  return {
    actions: mt.actions,
    user: mt.user
  };
};

const MidtypeProvider: React.FC = props => {
  const [state, setState] = useState(getCurrentContext());
  const context: IMidtypeContext = {
    ...state,
    update: useCallback(() => setState(getCurrentContext()), [setState])
  };
  return (
    <MidtypeContext.Provider value={context}>
      {props.children}
    </MidtypeContext.Provider>
  );
};

export default MidtypeProvider;
