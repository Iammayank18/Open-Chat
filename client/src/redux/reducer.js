const MainReducer = (state = [], action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        isLoggedIn: true,
        data: action.payload,
      };

    default:
      return state;
  }
};

export default MainReducer;
