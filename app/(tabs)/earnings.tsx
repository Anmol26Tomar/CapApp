import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react-native';
import { earningsService } from '../../services/api';
import type { Earning, EarningSummary } from '../../types';

export default function EarningsScreen() {
  const [summary, setSummary] = useState<EarningSummary>({
    today: 0,
    week: 0,
    month: 0,
    total: 0,
  });
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  const fetchEarnings = async () => {
    try {
      const [summaryData, earningsData] = await Promise.all([
        earningsService.getSummary(),
        earningsService.getEarnings(),
      ]);
      setSummary(summaryData);
      setEarnings(earningsData);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEarnings();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading earnings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.summarySection}>
          <View style={styles.mainCard}>
            <View style={styles.mainCardHeader}>
              <TrendingUp size={24} color="#10B981" />
              <Text style={styles.mainCardLabel}>Total Earnings</Text>
            </View>
            <Text style={styles.mainCardAmount}>{formatCurrency(summary.total)}</Text>
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>Today</Text>
              <Text style={styles.summaryCardAmount}>
                {formatCurrency(summary.today)}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>This Week</Text>
              <Text style={styles.summaryCardAmount}>
                {formatCurrency(summary.week)}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>This Month</Text>
              <Text style={styles.summaryCardAmount}>
                {formatCurrency(summary.month)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.filterSection}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedPeriod === 'week' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedPeriod === 'week' && styles.filterButtonTextActive,
              ]}
            >
              This Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedPeriod === 'month' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedPeriod === 'month' && styles.filterButtonTextActive,
              ]}
            >
              This Month
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          {earnings.length === 0 ? (
            <View style={styles.emptyState}>
              <DollarSign size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No earnings yet</Text>
              <Text style={styles.emptySubtext}>
                Complete trips to start earning
              </Text>
            </View>
          ) : (
            earnings.map((earning) => (
              <View key={earning.id} style={styles.earningCard}>
                <View style={styles.earningLeft}>
                  <View style={styles.iconContainer}>
                    <DollarSign size={20} color="#10B981" />
                  </View>
                  <View>
                    <Text style={styles.earningTitle}>Trip Payment</Text>
                    <View style={styles.earningMeta}>
                      <Calendar size={12} color="#9CA3AF" />
                      <Text style={styles.earningDate}>
                        {formatDate(earning.date)}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.earningAmount}>
                  {formatCurrency(earning.amount)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  summarySection: {
    padding: 16,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mainCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  mainCardLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  mainCardAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1F2937',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryCardLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  summaryCardAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  filterSection: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  filterButtonActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#2563EB',
  },
  historySection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  earningCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  earningLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  earningTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  earningMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  earningDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  earningAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
});
