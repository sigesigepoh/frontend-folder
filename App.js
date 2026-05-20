import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';

// When you deploy the backend, replace the deploy string below with your Render URL.
// For a local Snack/web preview, this will use the local Django backend at http://127.0.0.1:8000/api.
const DEPLOYED_API_BASE_URL = 'https://ua-peitel-api.onrender.com/api/';
const LOCAL_WEB_API_BASE_URL = 'http://127.0.0.1:8000/api';
const LOCAL_ANDROID_API_BASE_URL = 'http://10.0.2.2:8000/api';

const API_BASE_URL = DEPLOYED_API_BASE_URL.includes('YOUR_RENDER_BACKEND_URL')
  ? (Platform.OS === 'web' ? LOCAL_WEB_API_BASE_URL : LOCAL_ANDROID_API_BASE_URL)
  : DEPLOYED_API_BASE_URL;

export default function App() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('lost');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [query, setQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState('');
  const [backendStatus, setBackendStatus] = useState('Checking backend...');

  useEffect(() => {
    checkBackend();
    fetchItems();
  }, []);

  const checkBackend = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/items/`, { method: 'OPTIONS' });
      if (response.ok) {
        setBackendStatus(`Backend reachable at ${API_BASE_URL}`);
      } else {
        setBackendStatus(`Backend reachable but returned ${response.status}`);
      }
    } catch (error) {
      setBackendStatus('Backend unreachable');
      setBackendError(error.message);
    }
  };

  const fetchItems = async (search = '') => {
    setLoading(true);
    try {
      const url = search
        ? `${API_BASE_URL}/items/?search=${encodeURIComponent(search)}`
        : `${API_BASE_URL}/items/`;
      const response = await fetch(url);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Fetch failed ${response.status}: ${text}`);
      }
      const data = await response.json();
      setItems(data);
    } catch (error) {
      setBackendError(error.message);
      Alert.alert('Error', `Unable to fetch items. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedItem(null);
    setCategory('lost');
    setTitle('');
    setDescription('');
    setContact('');
  };

  const handleSaveItem = async () => {
    if (!title.trim() || !description.trim() || !contact.trim()) {
      Alert.alert('Missing data', 'Please fill in every field.');
      return;
    }

    const payload = {
      category,
      title: title.trim(),
      description: description.trim(),
      contact: contact.trim(),
    };

    const itemId = selectedItem?.id;
    const url = itemId
      ? `${API_BASE_URL}/items/${itemId}/`
      : `${API_BASE_URL}/items/`;
    const method = itemId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Request failed ${response.status}: ${text}`);
      }

      await fetchItems(query);
      resetForm();
      Alert.alert('Success', itemId ? 'Item updated.' : 'Item created.');
    } catch (error) {
      setBackendError(error.message);
      Alert.alert('Error', `Unable to save item. ${error.message}`);
    }
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setCategory(item.category);
    setTitle(item.title);
    setDescription(item.description);
    setContact(item.contact);
  };

  const handleDeleteItem = async (itemId) => {
    Alert.alert('Delete item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(`${API_BASE_URL}/items/${itemId}/`, {
              method: 'DELETE',
            });

            if (!response.ok && response.status !== 204) {
              throw new Error('Delete failed');
            }

            await fetchItems(query);
            if (selectedItem?.id === itemId) {
              resetForm();
            }
          } catch (error) {
            Alert.alert('Error', 'Unable to delete item.');
          }
        },
      },
    ]);
  };

  const handleSearch = async () => {
    fetchItems(query);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Lost & Found</Text>

      <View style={styles.searchSection}>
        <TextInput
          style={[styles.input, styles.searchInput]}
          placeholder="Search items..."
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.backendStatus}>{backendStatus}</Text>
      {backendError ? <Text style={styles.backendError}>{backendError}</Text> : null}

      <View style={styles.formSection}>
        <Text style={styles.subheading}>{selectedItem ? 'Edit Item' : 'Add Item'}</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleButton, category === 'lost' && styles.toggleButtonActive]}
            onPress={() => setCategory('lost')}
          >
            <Text style={styles.toggleText}>Lost</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, category === 'found' && styles.toggleButtonActive]}
            onPress={() => setCategory('found')}
          >
            <Text style={styles.toggleText}>Found</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Contact info"
          value={contact}
          onChangeText={setContact}
        />
        <TouchableOpacity style={styles.button} onPress={handleSaveItem}>
          <Text style={styles.buttonText}>{selectedItem ? 'Update' : 'Submit'}</Text>
        </TouchableOpacity>
        {selectedItem && (
          <TouchableOpacity style={styles.secondaryButton} onPress={resetForm}>
            <Text style={styles.secondaryText}>Cancel edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.subheading}>Items</Text>
      <ScrollView style={styles.listSection} contentContainerStyle={styles.listContent}>
        {loading ? (
          <Text style={styles.statusText}>Loading items...</Text>
        ) : items.length === 0 ? (
          <Text style={styles.statusText}>No items found.</Text>
        ) : (
          items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <Text style={styles.itemCategory}>{item.category.toUpperCase()}</Text>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
              <Text style={styles.itemContact}>Contact: {item.contact}</Text>
              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleEditItem(item)}>
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButtonDanger} onPress={() => handleDeleteItem(item.id)}>
                  <Text style={styles.actionText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fb',
    padding: 16,
    paddingTop: 50,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1f2937',
  },
  subheading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111827',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
    marginRight: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#2563eb',
  },
  toggleText: {
    color: '#111827',
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderColor: '#9ca3af',
    borderWidth: 1,
  },
  secondaryText: {
    color: '#1f2937',
    fontWeight: '700',
  },
  listSection: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 40,
  },
  statusText: {
    color: '#4b5563',
    textAlign: 'center',
    marginTop: 16,
  },
  backendStatus: {
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  },
  backendError: {
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemCategory: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '700',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  itemDescription: {
    color: '#4b5563',
    marginBottom: 8,
  },
  itemContact: {
    color: '#475569',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#0f766e',
    alignItems: 'center',
  },
  actionButtonDanger: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#dc2626',
    alignItems: 'center',
  },
  actionText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
