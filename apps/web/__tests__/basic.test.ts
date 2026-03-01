describe('AITriplan Basic Tests', () => {
  it('should pass a basic test', () => {
    expect(true).toBe(true)
  })

  it('should handle simple math', () => {
    expect(1 + 1).toBe(2)
    expect(2 * 3).toBe(6)
  })

  it('should work with arrays', () => {
    const arr = [1, 2, 3]
    expect(arr).toHaveLength(3)
    expect(arr).toContain(2)
  })

  it('should work with objects', () => {
    const obj = { name: 'aitriplan', version: '0.1.0' }
    expect(obj).toHaveProperty('name')
    expect(obj.name).toBe('aitriplan')
  })
})
