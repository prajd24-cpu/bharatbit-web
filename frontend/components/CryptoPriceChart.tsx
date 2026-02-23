import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { theme } from '../constants/theme';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const { width } = Dimensions.get('window');

interface CryptoPriceCardProps {
  token: string;
  symbol: string;
  name: string;
}

export const CryptoPriceCard: React.FC<CryptoPriceCardProps> = ({ token, symbol, name }) => {
  const [price, setPrice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadPriceData();
    const interval = setInterval(loadPriceData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [symbol]);

  const loadPriceData = async () => {
    try {
      const [priceRes, historyRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/crypto/prices?symbols=${symbol}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { prices: {} } })),
        axios.get(`${BACKEND_URL}/api/crypto/prices/${symbol}/history?days=7`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { data: [] } }))
      ]);
      
      setPrice(priceRes.data.prices[symbol] || null);
      setHistory(historyRes.data.data || []);
    } catch (error) {
      console.error('Error loading price:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value: number, currency: string = 'INR') => {
    if (!value) return '---';
    if (currency === 'INR') {
      if (value >= 100000) {
        return `₹${(value / 100000).toFixed(2)}L`;
      }
      return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    }
    return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  };

  const formatChange = (change: number) => {
    if (!change) return '0.00%';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  // Simple sparkline visualization
  const renderSparkline = () => {
    if (history.length < 2) return null;
    
    const prices = history.map(h => h.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    
    const points = prices.map((p, i) => {
      const x = (i / (prices.length - 1)) * 100;
      const y = 100 - ((p - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    const isPositive = prices[prices.length - 1] >= prices[0];
    
    return (
      <View style={styles.sparklineContainer}>
        <View style={styles.sparkline}>
          {prices.map((p, i) => {
            const height = ((p - min) / range) * 40 + 5;
            return (
              <View 
                key={i}
                style={[
                  styles.sparkBar,
                  { 
                    height,
                    backgroundColor: isPositive ? theme.colors.success + '60' : theme.colors.error + '60'
                  }
                ]}
              />
            );
          })}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  const change = price?.inr_24h_change || 0;
  const isPositive = change >= 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.symbolContainer}>
          <Text style={styles.symbol}>{symbol}</Text>
          <Text style={styles.name}>{name}</Text>
        </View>
        <View style={[styles.changeBadge, { backgroundColor: isPositive ? theme.colors.success + '20' : theme.colors.error + '20' }]}>
          <Text style={[styles.changeText, { color: isPositive ? theme.colors.success : theme.colors.error }]}>
            {formatChange(change)}
          </Text>
        </View>
      </View>
      
      {renderSparkline()}
      
      <View style={styles.priceRow}>
        <Text style={styles.priceINR}>{formatPrice(price?.inr, 'INR')}</Text>
        <Text style={styles.priceUSD}>{formatPrice(price?.usd, 'USD')}</Text>
      </View>
    </View>
  );
};

interface CryptoPriceListProps {
  token: string;
}

export const CryptoPriceList: React.FC<CryptoPriceListProps> = ({ token }) => {
  const cryptos = [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'USDT', name: 'Tether' },
  ];

  return (
    <View style={styles.listContainer}>
      <Text style={styles.listTitle}>Live Crypto Prices</Text>
      <View style={styles.cardRow}>
        {cryptos.map((crypto) => (
          <CryptoPriceCard
            key={crypto.symbol}
            token={token}
            symbol={crypto.symbol}
            name={crypto.name}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    marginBottom: theme.spacing.lg,
  },
  listTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  card: {
    flex: 1,
    minWidth: (width - 48) / 3 - 8,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  symbolContainer: {
    flex: 1,
  },
  symbol: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  name: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  changeBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  changeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  sparklineContainer: {
    height: 45,
    marginVertical: theme.spacing.sm,
  },
  sparkline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    gap: 2,
  },
  sparkBar: {
    flex: 1,
    borderRadius: 2,
  },
  priceRow: {
    marginTop: theme.spacing.xs,
  },
  priceINR: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  priceUSD: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});

export default CryptoPriceCard;
