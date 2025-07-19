import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/routing/app_router.dart';

class SearchPage extends StatefulWidget {
  const SearchPage({super.key});

  @override
  State<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> {
  final _searchController = TextEditingController();
  final _companyNameController = TextEditingController();
  final _vatNumberController = TextEditingController();
  final _cityController = TextEditingController();
  bool _isLoading = false;
  List<Company> _searchResults = [];

  @override
  void dispose() {
    _searchController.dispose();
    _companyNameController.dispose();
    _vatNumberController.dispose();
    _cityController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          // Search Form
          Container(
            padding: const EdgeInsets.all(16.0),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Company Search',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Find detailed business information and reports',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.outline,
                      ),
                    ),
                    const SizedBox(height: 24),
                    
                    // Quick Search
                    TextField(
                      controller: _searchController,
                      decoration: InputDecoration(
                        labelText: 'Quick Search',
                        hintText: 'Search by company name, VAT, or keyword',
                        prefixIcon: const Icon(Icons.search),
                        suffixIcon: IconButton(
                          icon: const Icon(Icons.clear),
                          onPressed: () {
                            _searchController.clear();
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    
                    // Advanced Search Section
                    ExpansionTile(
                      title: const Text('Advanced Search'),
                      children: [
                        const SizedBox(height: 16),
                        TextField(
                          controller: _companyNameController,
                          decoration: const InputDecoration(
                            labelText: 'Company Name',
                            hintText: 'Enter company name',
                            prefixIcon: Icon(Icons.business),
                          ),
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _vatNumberController,
                          decoration: const InputDecoration(
                            labelText: 'VAT Number',
                            hintText: 'Enter VAT number',
                            prefixIcon: Icon(Icons.numbers),
                          ),
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _cityController,
                          decoration: const InputDecoration(
                            labelText: 'City',
                            hintText: 'Enter city name',
                            prefixIcon: Icon(Icons.location_city),
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                    ),
                    const SizedBox(height: 24),
                    
                    // Search Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isLoading ? null : _handleSearch,
                        child: _isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : const Text('Search Companies'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          
          // Results Section
          Expanded(
            child: _buildResults(),
          ),
        ],
      ),
    );
  }

  Widget _buildResults() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (_searchResults.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.search,
              size: 64,
              color: Theme.of(context).colorScheme.outline,
            ),
            const SizedBox(height: 16),
            Text(
              'Start your search',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                color: Theme.of(context).colorScheme.outline,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Enter search criteria above to find companies',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.outline,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16.0),
      itemCount: _searchResults.length,
      itemBuilder: (context, index) {
        final company = _searchResults[index];
        return _buildCompanyCard(company);
      },
    );
  }

  Widget _buildCompanyCard(Company company) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {
          context.go(AppRoutes.companyDetail.replaceAll(':id', company.id));
        },
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: Theme.of(context).primaryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      Icons.business,
                      color: Theme.of(context).primaryColor,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          company.name,
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          company.vatNumber,
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Theme.of(context).colorScheme.outline,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Icon(
                    Icons.arrow_forward_ios,
                    size: 16,
                    color: Theme.of(context).colorScheme.outline,
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                company.address,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  _buildInfoChip(company.sector, Icons.category),
                  const SizedBox(width: 8),
                  _buildInfoChip(company.city, Icons.location_on),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoChip(String label, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 12,
            color: Theme.of(context).colorScheme.outline,
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
    );
  }

  Future<void> _handleSearch() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // Simulate API call
      await Future.delayed(const Duration(seconds: 2));
      
      // Mock search results
      final mockResults = [
        Company(
          id: '1',
          name: 'Tech Innovations SpA',
          vatNumber: 'IT12345678901',
          address: 'Via Roma 123, Milano, Italy',
          city: 'Milano',
          sector: 'Technology',
        ),
        Company(
          id: '2',
          name: 'Green Energy Solutions Srl',
          vatNumber: 'IT98765432109',
          address: 'Via Venezia 456, Roma, Italy',
          city: 'Roma',
          sector: 'Energy',
        ),
        Company(
          id: '3',
          name: 'Fashion Forward Srl',
          vatNumber: 'IT11223344556',
          address: 'Via Torino 789, Firenze, Italy',
          city: 'Firenze',
          sector: 'Fashion',
        ),
      ];

      setState(() {
        _searchResults = mockResults;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Search failed. Please try again.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }
}

class Company {
  final String id;
  final String name;
  final String vatNumber;
  final String address;
  final String city;
  final String sector;

  Company({
    required this.id,
    required this.name,
    required this.vatNumber,
    required this.address,
    required this.city,
    required this.sector,
  });
}
