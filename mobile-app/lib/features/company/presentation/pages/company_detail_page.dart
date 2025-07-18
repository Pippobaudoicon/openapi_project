import 'package:flutter/material.dart';

class CompanyDetailPage extends StatefulWidget {
  final String companyId;

  const CompanyDetailPage({
    Key? key,
    required this.companyId,
  }) : super(key: key);

  @override
  State<CompanyDetailPage> createState() => _CompanyDetailPageState();
}

class _CompanyDetailPageState extends State<CompanyDetailPage> {
  bool _isLoading = true;
  CompanyDetail? _companyDetail;

  @override
  void initState() {
    super.initState();
    _loadCompanyDetail();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _companyDetail != null
              ? _buildCompanyDetail()
              : _buildErrorState(),
    );
  }

  Widget _buildCompanyDetail() {
    final company = _companyDetail!;
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: Theme.of(context).primaryColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Icon(
                          Icons.business,
                          color: Theme.of(context).primaryColor,
                          size: 30,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              company.name,
                              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              company.vatNumber,
                              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                color: Theme.of(context).colorScheme.outline,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildStatusChip(company.status),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Basic Information
          _buildInfoSection(
            'Basic Information',
            [
              InfoItem('Legal Form', company.legalForm),
              InfoItem('Sector', company.sector),
              InfoItem('Founded', company.foundedYear),
              InfoItem('Employees', company.employees),
            ],
          ),
          const SizedBox(height: 16),

          // Contact Information
          _buildInfoSection(
            'Contact Information',
            [
              InfoItem('Address', company.address),
              InfoItem('City', company.city),
              InfoItem('Province', company.province),
              InfoItem('Postal Code', company.postalCode),
              InfoItem('Phone', company.phone),
              InfoItem('Email', company.email),
              InfoItem('Website', company.website),
            ],
          ),
          const SizedBox(height: 16),

          // Financial Information
          _buildInfoSection(
            'Financial Information',
            [
              InfoItem('Revenue', company.revenue),
              InfoItem('Share Capital', company.shareCapital),
              InfoItem('Credit Rating', company.creditRating),
            ],
          ),
          const SizedBox(height: 16),

          // Actions
          _buildActionsSection(),
        ],
      ),
    );
  }

  Widget _buildInfoSection(String title, List<InfoItem> items) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ...items.map((item) => _buildInfoRow(item.label, item.value)),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.outline,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    Color color;
    switch (status.toLowerCase()) {
      case 'active':
        color = Colors.green;
        break;
      case 'inactive':
        color = Colors.red;
        break;
      default:
        color = Colors.orange;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status.toUpperCase(),
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
          color: color,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildActionsSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Actions',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      // Export company data
                    },
                    icon: const Icon(Icons.download),
                    label: const Text('Export'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      // Generate report
                    },
                    icon: const Icon(Icons.analytics),
                    label: const Text('Generate Report'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            size: 64,
            color: Theme.of(context).colorScheme.error,
          ),
          const SizedBox(height: 16),
          Text(
            'Company not found',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          Text(
            'The requested company could not be loaded.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Theme.of(context).colorScheme.outline,
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: const Text('Go Back'),
          ),
        ],
      ),
    );
  }

  Future<void> _loadCompanyDetail() async {
    try {
      // Simulate API call
      await Future.delayed(const Duration(seconds: 2));
      
      // Mock company detail
      final mockDetail = CompanyDetail(
        id: widget.companyId,
        name: 'Tech Innovations SpA',
        vatNumber: 'IT12345678901',
        legalForm: 'Società per Azioni',
        sector: 'Information Technology',
        foundedYear: '2010',
        employees: '50-100',
        status: 'Active',
        address: 'Via Roma 123',
        city: 'Milano',
        province: 'MI',
        postalCode: '20121',
        phone: '+39 02 1234567',
        email: 'info@techinnovations.it',
        website: 'www.techinnovations.it',
        revenue: '€2.5M (2023)',
        shareCapital: '€100,000',
        creditRating: 'A-',
      );

      setState(() {
        _companyDetail = mockDetail;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
    }
  }
}

class CompanyDetail {
  final String id;
  final String name;
  final String vatNumber;
  final String legalForm;
  final String sector;
  final String foundedYear;
  final String employees;
  final String status;
  final String address;
  final String city;
  final String province;
  final String postalCode;
  final String phone;
  final String email;
  final String website;
  final String revenue;
  final String shareCapital;
  final String creditRating;

  CompanyDetail({
    required this.id,
    required this.name,
    required this.vatNumber,
    required this.legalForm,
    required this.sector,
    required this.foundedYear,
    required this.employees,
    required this.status,
    required this.address,
    required this.city,
    required this.province,
    required this.postalCode,
    required this.phone,
    required this.email,
    required this.website,
    required this.revenue,
    required this.shareCapital,
    required this.creditRating,
  });
}

class InfoItem {
  final String label;
  final String value;

  InfoItem(this.label, this.value);
}
