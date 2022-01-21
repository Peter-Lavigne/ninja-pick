class Pick < ApplicationRecord
  belongs_to :event
  belongs_to :user
  belongs_to :ninja

  validates :placement, numericality: {
    only_integer: true,
    greater_than_or_equal_to: 0,
    less_than: 3
  }
end
