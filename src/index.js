import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  useReducer
} from "react";

const DataStoreContext = createContext();
const DataActionsContext = createContext();

const reducer = (state, { type, payload }) => {
  switch (type) {
    case "ADD_COLLECTION":
      const { collection, data } = payload;
      return { ...state, [collection]: data };
    default:
      return state;
  }
};

const DataStore = props => {
  const { firebase, collections, children } = props;
  // // const [state, setState] = React.useState({});
  const [state, dispatch] = useReducer(reducer, {});

  React.useEffect(() => {
    if (collections) {
      const listeners = collections.map(setCollectionListener);
      return () => listeners.forEach(invoke);
    }
  }, [collections, firebase]);

  const invoke = fn => fn();

  const setCollectionListener = collection =>
    firebase
      .firestore()
      .collection(collection)
      .onSnapshot(handleSnapshot);

  function setListener(collection) {
    if (state[collection]) {
      return () => {};
    } else {
      return setCollectionListener(collection);
    }
  }

  const addCollection = (collection, data) => ({
    type: `ADD_COLLECTION`,
    payload: { collection, data }
  });

  const handleSnapshot = snapshot => {
    const collection = snapshot.query._query.path.segments[0];
    const data = createCollectionStoreObj(snapshot.docs);
    dispatch(addCollection(collection, data));
  };

  return (
    <DataStoreContext.Provider value={state}>
      <DataActionsContext.Provider value={setListener}>
        {children}
      </DataActionsContext.Provider>
    </DataStoreContext.Provider>
  );
};

function useDataStore() {
  return useContext(DataStoreContext);
}
function useDataActions() {
  return useContext(DataActionsContext);
}

export default DataStore;
export { useDataStore, useDataActions };

function createCollectionStoreObj(docs) {
  const storeItem = { data: {}, list: [] };
  docs.forEach(doc => {
    const document = formatDocSnap(doc);
    storeItem.data[doc.id] = document;
    storeItem.list.push(document);
  });
  return storeItem;
}

function formatDocSnap(docSnap) {
  return { id: docSnap.id, ...docSnap.data() };
}
