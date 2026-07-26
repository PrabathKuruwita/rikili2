export const USER_ROLES = {
  VEHICLE_OWNER: 'vehicle-owner',
  GARAGE_OWNER: 'garage-owner',
};

function UserRoleToggle({ role, onRoleChange }) {
  return (
    <div className="role-toggle" role="tablist" aria-label="Account type">
      <button
        type="button"
        role="tab"
        aria-selected={role === USER_ROLES.VEHICLE_OWNER}
        className={role === USER_ROLES.VEHICLE_OWNER ? 'active' : ''}
        onClick={() => onRoleChange(USER_ROLES.VEHICLE_OWNER)}
      >
        Vehicle Owner
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={role === USER_ROLES.GARAGE_OWNER}
        className={role === USER_ROLES.GARAGE_OWNER ? 'active' : ''}
        onClick={() => onRoleChange(USER_ROLES.GARAGE_OWNER)}
      >
        Garage Owner
      </button>
    </div>
  );
}

export default UserRoleToggle;
