export default function access(
  initialState: { currentUser?: API.LoginUserVO} | undefined,
) {
  const { currentUser } = initialState ?? {};
  return {
    canAdmin: currentUser && currentUser.userRole === 'admin',
    // canAdmin: true,
  };
}

