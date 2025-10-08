import { Users, Crown, Star, UserPlus } from 'lucide-react';

interface ProductTeamProps {
  team: {
    owners?: any[];
    coreTeam?: any[];
    contributors?: any[];
  };
}

export default function ProductTeam({ team }: ProductTeamProps) {
  const { owners = [], coreTeam = [], contributors = [] } = team;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Team</h3>
      </div>

      <div className="space-y-6">
        {owners.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-4 h-4 text-yellow-600" />
              <h4 className="text-sm font-semibold text-gray-700 uppercase">Owners</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {owners.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{member.name}</div>
                    <div className="text-xs text-yellow-700">Product Owner</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {coreTeam.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-semibold text-gray-700 uppercase">Core Team</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {coreTeam.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{member.name}</div>
                    <div className="text-xs text-blue-700">Core Member</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {contributors.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="w-4 h-4 text-gray-600" />
              <h4 className="text-sm font-semibold text-gray-700 uppercase">Contributors</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {contributors.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{member.name}</div>
                    <div className="text-xs text-gray-600">Contributor</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {owners.length === 0 && coreTeam.length === 0 && contributors.length === 0 && (
          <p className="text-gray-500 text-center py-4">No team members assigned yet.</p>
        )}
      </div>
    </div>
  );
}
