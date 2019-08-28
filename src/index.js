import React, { useState, useEffect, useContext, createContext } from "react";

const DataStoreContext = createContext();

const DataStore = props => {
  const { firebase, collections, children } = props;
  const [state, setState] = React.useState({});

  React.useEffect(() => {
    const listeners = collections.map(setCollectionListener);
    return () => listeners.forEach(listener => listener());
  }, [collections, firebase]);

  const setCollectionListener = collection =>
    firebase
      .firestore()
      .collection(collection)
      .onSnapshot(handleSnapshot);

  const handleSnapshot = snapshot => {
    const collection = snapshot.query._query.path.segments[0];
    const formatedDocs = snapshot.docs.map(formatDocSnap);
    setState(p => ({ ...p, [collection]: formatedDocs }));
  };

  const formatDocSnap = docSnap => ({ id: docSnap.id, ...docSnap.data() });

  console.log(state);

  return (
    <DataStoreContext.Provider value={state}>
      {children}
    </DataStoreContext.Provider>
  );
};

function useDataStore() {
  return useContext(DataStoreContext);
}

export default DataStore;
export { useDataStore };
