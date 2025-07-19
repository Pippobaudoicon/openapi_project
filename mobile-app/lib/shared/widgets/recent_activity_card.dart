import 'package:flutter/material.dart';

class RecentActivityCard extends StatelessWidget {
  const RecentActivityCard({super.key});

  @override
  Widget build(BuildContext context) {
    final activities = [
      Activity(
        title: 'Company Search',
        description: 'Searched for "Tech Startup" companies',
        timestamp: '2 hours ago',
        icon: Icons.search,
        color: Colors.blue,
      ),
      Activity(
        title: 'Report Generated',
        description: 'Business report for ABC Corp completed',
        timestamp: '4 hours ago',
        icon: Icons.analytics,
        color: Colors.green,
      ),
      Activity(
        title: 'Profile Updated',
        description: 'Account settings were modified',
        timestamp: '1 day ago',
        icon: Icons.person,
        color: Colors.orange,
      ),
      Activity(
        title: 'File Upload',
        description: 'Document.pdf uploaded successfully',
        timestamp: '2 days ago',
        icon: Icons.upload_file,
        color: Colors.purple,
      ),
    ];

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Recent Activity',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: activities.length,
              separatorBuilder: (context, index) => const Divider(height: 20),
              itemBuilder: (context, index) {
                final activity = activities[index];
                return _buildActivityItem(context, activity);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityItem(BuildContext context, Activity activity) {
    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: activity.color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(
            activity.icon,
            color: activity.color,
            size: 20,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                activity.title,
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                activity.description,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Theme.of(context).colorScheme.outline,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
        Text(
          activity.timestamp,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: Theme.of(context).colorScheme.outline,
          ),
        ),
      ],
    );
  }
}

class Activity {
  final String title;
  final String description;
  final String timestamp;
  final IconData icon;
  final Color color;

  Activity({
    required this.title,
    required this.description,
    required this.timestamp,
    required this.icon,
    required this.color,
  });
}
