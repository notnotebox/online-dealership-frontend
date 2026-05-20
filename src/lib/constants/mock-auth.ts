export type UserRole = 'guest' | 'client' | 'staff'

export const mockAuth = {
  loggedIn: true,
  role: 'staff' as UserRole,
  user: {
    firstName: 'Client',
    lastName: 'Demo',
    email: 'client.demo@m-motors.fr',
  },
}
