import AvatarGroup from '@/components/ui/avatar-group';

export default function AvatarGroupDemo() {
  return (
    <div className="p-8 space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Avatar Group Demo</h3>
        <div className="flex items-center space-x-4">
          <AvatarGroup
            items={[
              {
                id: 1,
                name: 'Sarah Johnson',
                designation: 'Product Manager',
                image: 'https://randomuser.me/api/portraits/women/1.jpg',
              },
              {
                id: 2,
                name: 'Mike Chen',
                designation: 'UX Designer',
                image: 'https://randomuser.me/api/portraits/men/2.jpg',
              },
              {
                id: 3,
                name: 'Emma Davis',
                designation: 'Frontend Developer',
                image: 'https://randomuser.me/api/portraits/women/3.jpg',
              },
              {
                id: 4,
                name: 'Alex Rodriguez',
                designation: 'Backend Developer',
                image: 'https://randomuser.me/api/portraits/men/4.jpg',
              },
              {
                id: 5,
                name: 'Lisa Wang',
                designation: 'QA Engineer',
                image: 'https://randomuser.me/api/portraits/women/5.jpg',
              },
              {
                id: 6,
                name: 'David Kim',
                designation: 'DevOps Engineer',
                image: 'https://randomuser.me/api/portraits/men/6.jpg',
              },
            ]}
            maxVisible={5}
            size="md"
          />
        </div>
      </div>
    </div>
  );
}
