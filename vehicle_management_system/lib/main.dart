import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Environment variables
  const String supabaseUrl = 'https://qdzomfkzbxwedoyhlvkl.supabase.co';
  const String supabaseAnonKey = 'sb_publishable_WlGdVFQSkOB19M2FWEEaRg_efoPsgTn';

  await Supabase.initialize(
    url: supabaseUrl,
    publishableKey: supabaseAnonKey,
  );

  runApp(const MyApp());
}

final supabase = Supabase.instance.client;

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        body: Center(child: Text("Supabase Connected 🚀")),
      ),
    );
  }
}